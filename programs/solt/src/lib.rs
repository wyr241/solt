use anchor_lang::prelude::*;

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};


declare_id!("FrcTaQLfMqkPyrtQGFxLSy7NH1h5o7WANTkbH2wjVqdx");

entrypoint!(process_instruction);

    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        input: &[u8],
    ) -> ProgramResult {
        let acc_iter = &mut accounts.iter();
        let alice_info = next_account_info(acc_iter)?;
        let bob_info = next_account_info(acc_iter)?;
        // the third account is SystemProgram. Don't forget it in a client

        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(ProgramError::InvalidInstructionData)?;

        invoke(
            &system_instruction::transfer(alice_info.key, bob_info.key, amount),
            &[alice_info.clone(), bob_info.clone()],
        )?;
        msg!("transfer {} lamports from {:?} to {:?}: done", amount, alice_info.key, bob_info.key);
    
        Ok(())
    }


