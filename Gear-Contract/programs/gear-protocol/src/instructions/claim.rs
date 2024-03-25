use crate::state::*;
use anchor_lang::prelude::*;

pub fn claim(ctx: Context<ClaimToken>) -> Result<()> {
    let pda_account: AccountInfo<'_> = ctx.accounts.gear.to_account_info();
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(16);
    let lamports = pda_account.lamports() - rent_lamports;
    let send_to_account = ctx.accounts.signer.to_account_info();
    msg!("pda_account balance={}", pda_account.as_ref().lamports());
    msg!("send_to_account balance={}", send_to_account.as_ref().lamports());
    msg!("transfer lamports from={} to={}, amount={}", pda_account.as_ref().key(), send_to_account.as_ref().key(), lamports);
    **pda_account.try_borrow_mut_lamports()? -= lamports;
    **send_to_account.try_borrow_mut_lamports()? += lamports;
    msg!("pda_account balance={}", pda_account.as_ref().lamports());
    msg!("send_to_account balance={}", send_to_account.as_ref().lamports());
    Ok(())
}

#[derive(Accounts)]
pub struct ClaimToken<'info> {
    /// CHECK the nft address we pass into
    pub nft: AccountInfo<'info>,
    #[account(mut, seeds=[nft.key().as_ref()], bump)]
    pub gear: Account<'info, Gear>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
