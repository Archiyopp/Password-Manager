#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use tauri_plugin_sql::{Migration, MigrationKind, TauriSql};

#[tauri::command]
fn hash(password: String) -> String {
    let password_bytes = password.as_bytes();
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password_bytes, &salt)
        .expect("Error hashing password")
        .to_string()
}

#[tauri::command]
fn verify(hashed_password: String, password: String) -> bool {
    let parsed_hash = PasswordHash::new(&hashed_password).expect("problem using password hash");
    let password_bytes = password.as_bytes();

    Argon2::default()
        .verify_password(password_bytes, &parsed_hash)
        .is_ok()
}

static MAGIC_KEY: &str =
    "magickeya@W,sdljfl:as,kdjfaiASJDdasw&#'($&*(#&P$jsadfhaks(*#$)(#*$(jkfjkdsf";

#[tauri::command]
fn encrypt(password: String) -> String {
    let mc = new_magic_crypt!(MAGIC_KEY, 256);
    mc.encrypt_str_to_base64(password)
}

#[tauri::command]
fn decrypt(encrypted: String) -> String {
    let mc = new_magic_crypt!(MAGIC_KEY, 256);
    mc.decrypt_base64_to_string(encrypted)
        .expect("error decrypting")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![hash, verify, encrypt, decrypt])
        .plugin(TauriSql::default().add_migrations(
            "sqlite:manager.db",
            vec![Migration {
                version: 1,
                description: "sqlite",
                sql: include_str!("../migrations/1.sql"),
                kind: MigrationKind::Up,
            }],
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
