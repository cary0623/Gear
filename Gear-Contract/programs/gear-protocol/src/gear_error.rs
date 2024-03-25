use anchor_lang::error_code;


#[error_code]
pub enum GearError {
    #[msg("user do not have sufficient lamports to call gear")]
    InsufficientBalanceToCall
}