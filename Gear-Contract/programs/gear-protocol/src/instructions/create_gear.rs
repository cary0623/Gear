use anchor_lang::prelude::*;
use crate::state::gear::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        Metadata, 
        create_master_edition_v3, 
        create_metadata_accounts_v3,
        CreateMasterEditionV3,
        CreateMetadataAccountsV3
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::accounts::{MasterEdition, Metadata as MetadataAccount};
use anchor_spl::metadata::mpl_token_metadata::types::DataV2;


pub fn create_gear(ctx: Context<CreateGear>, name: String, symbol: String, uri: String, price: f64, encrypt_path: String) -> Result<()> {
    // MINT NFT
    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(), 
        MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.associated_token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        }
    );
    mint_to(cpi_context, 1)?;
    // create metadata account
    let cpi_context = CpiContext::new(
        ctx.accounts.token_metadata_program.to_account_info(), 
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.signer.to_account_info(),
            payer: ctx.accounts.signer.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
            update_authority: ctx.accounts.signer.to_account_info(),
        }
    );
    let data_v2 = DataV2 {
        name: name,
        symbol: symbol,
        uri: uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None
    };
    create_metadata_accounts_v3(cpi_context, data_v2, false, true, None)?;
    // create master edition account
    let cpi_context = CpiContext::new(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            update_authority: ctx.accounts.signer.to_account_info(),
            mint_authority: ctx.accounts.signer.to_account_info(),
            payer: ctx.accounts.signer.to_account_info(),
            metadata: ctx.accounts.metadata_account.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info()
        }
    );
    create_master_edition_v3(cpi_context, Some(10))?;
    // saving price to PDA
    let new_gear = &mut ctx.accounts.gear_account;
    new_gear.price = price;
    new_gear.encrypt_path = encrypt_path;
    Ok(())    
}

#[derive(Accounts)]
pub struct CreateGear<'info> {

    #[account(mut, signer)]
    pub signer: Signer<'info>,

    #[account(
        init, 
        payer=signer, 
        space = 8 + Gear::INIT_SPACE,
        seeds = [mint.key().as_ref()],
        bump
    )]
    pub gear_account: Account<'info, Gear>,

    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    #[account(
        mut, 
        address=MetadataAccount::find_pda(&mint.key()).0
    )]
    /// CHECK: address
    pub metadata_account: AccountInfo<'info>,
    /// CHECK: 
    #[account(
        mut, 
        address=MasterEdition::find_pda(&mint.key()).0
    )]
    pub master_edition_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}