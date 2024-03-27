use anchor_lang::prelude::*;
use solana_program::native_token::LAMPORTS_PER_SOL;
use crate::state::*;
use crate::gear_error::GearError;


pub fn call(ctx: Context<CallGear>) -> Result<()> {
    let amount_lamports = (ctx.accounts.gear.price * LAMPORTS_PER_SOL as f64) as u64;
    let from: &Signer<'_> = &ctx.accounts.user;
    let to: &AccountInfo<'_> = &ctx.accounts.gear.to_account_info();
    let user_balance = from.as_ref().lamports();
    msg!("user balance={}", user_balance);
    msg!("call amount {}", amount_lamports);
    msg!("send_to_account balance={}", to.as_ref().lamports());
    msg!("transfer lamports from={} to={}, amount={} lamport", from.as_ref().key(), to.as_ref().key(), amount_lamports);
    require!(user_balance >= amount_lamports, GearError::InsufficientBalanceToCall);
    let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(from.key, to.key, amount_lamports);
    anchor_lang::solana_program::program::invoke_signed(
        &transfer_instruction,
        &[
            from.to_account_info(),
            to.clone(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[],
    )?;
    msg!("user balance={}", user_balance);
    msg!("send_to_account balance={}", to.as_ref().lamports());
    Ok(())
}

#[derive(Accounts)]
pub struct CallGear<'info> {
    /// CHECK: address
    pub nft: AccountInfo<'info>,
    #[account(mut, seeds=[nft.key().as_ref()], bump)]
    pub gear: Account<'info, Gear>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
