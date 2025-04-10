const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const nacl = require('tweetnacl');
const fs = require('fs');

async function generateSolanaWallet() {
    try {
        const mnemonic = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
        const naclKeypair = nacl.sign.keyPair.fromSeed(derivedSeed);
        const keypair = Keypair.fromSecretKey(Uint8Array.from(naclKeypair.secretKey));
        const publicKey = keypair.publicKey.toString();
        const privateKey = bs58.encode(Buffer.from(keypair.secretKey));
        const address = publicKey; // Alias for clarity

        return {
            mnemonic,
            publicKey,
            privateKey,
            address
        };
    } catch (error) {
        console.error('Error generating wallet:', error);
        throw error;
    }
}

async function main() {
    const totalWallets = 200; // ?? Ganti jumlah wallet di sini
    const wallets = [];

    console.log(`Generating ${totalWallets} Solana wallets...\n`);

    let txtOutput = '';

    for (let i = 0; i < totalWallets; i++) {
        const wallet = await generateSolanaWallet();
        wallets.push(wallet);

        const walletText = `Wallet ${i + 1}
Mnemonic     : ${wallet.mnemonic}
Address      : ${wallet.address}
Public Key   : ${wallet.publicKey}
Private Key  : ${wallet.privateKey}
-----------------------------\n`;

        console.log(walletText);
        txtOutput += walletText;
    }

    // Simpan ke file
    fs.writeFileSync('solana_wallets.json', JSON.stringify(wallets, null, 2));
    fs.writeFileSync('wallets.txt', txtOutput);

    console.log(`\n? ${totalWallets} wallet berhasil disimpan ke:
- solana_wallets.json (JSON)
- wallets.txt (Teks terbaca manusia, termasuk Address)`);
}

main();
