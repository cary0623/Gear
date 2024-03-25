use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod gear_error;

declare_id!("9kFWw3AnZXiTAgj3Les4sxGxmMmFLPQH79NGwZ32GSvP");

#[program]
pub mod gear_protocol {
    use super::*;

    pub fn create_gear(ctx: Context<CreateGear>, name: String, symbol: String, uri: String, price: f64) -> Result<()> {
        instructions::create_gear::create_gear(ctx, name, symbol, uri, price)
    }

    pub fn call_gear(ctx: Context<CallGear>) -> Result<()> {
        instructions::call_gear::call(ctx)
    }

    pub fn claim(ctx: Context<ClaimToken>) -> Result<()> {
        instructions::claim::claim(ctx)
    }
}

