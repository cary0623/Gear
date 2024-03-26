use anchor_lang::prelude::*;


#[account]
#[derive(InitSpace)]
pub struct Gear {
    pub price: f64,
    #[max_len(256)]
    pub encrypt_path: String,
}