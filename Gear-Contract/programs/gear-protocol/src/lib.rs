use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod gear_error;

declare_id!("Ders6v6yfeAN2WVXUoNZbQ778YxTLe3dF4tBBo4dURDo");

#[program]
pub mod gear_protocol {
    use super::*;

    pub fn create_gear(ctx: Context<CreateGear>, name: String, symbol: String, uri: String, price: f64, path: String) -> Result<()> {
        instructions::create_gear::create_gear(ctx, name, symbol, uri, price, path)
    }

    pub fn call_gear(ctx: Context<CallGear>) -> Result<()> {
        instructions::call_gear::call(ctx)
    }

    pub fn claim(ctx: Context<ClaimToken>) -> Result<()> {
        instructions::claim::claim(ctx)
    }
}

