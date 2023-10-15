import { Network, networks, crypto, address, payments } from 'bitcoinjs-lib';
import bs58check from 'bs58check';
import { ScriptType } from 'interface';

export function privateKeyToWIF(privateKeyHex: string) {
  const versionByte = Buffer.from([0x80]); // Mainnet version byte
  const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
  const extendedPrivateKey = Buffer.concat([versionByte, privateKeyBytes]);

  return bs58check.encode(extendedPrivateKey);
}

export function getAddress(
  network: Network,
  publicKey: string,
  scriptType?: ScriptType,
) {
  const bufferPublicKey = Buffer.from(publicKey, 'hex');
  const hash = crypto.hash160(bufferPublicKey);

  const addresses: Record<string, string> = {};

  if (network === networks.bitcoin) {
    addresses['P2PKH'] = address.toBase58Check(hash, 0);

    const result = payments.p2sh({
      redeem: payments.p2wpkh({ pubkey: bufferPublicKey, network }),
    });
    addresses['P2SH-P2WPKH'] = result.address;

    addresses['P2WPKH'] = address.toBech32(hash, 0, 'bc');

    const p2trInstance = payments.p2tr({
      internalPubkey: bufferPublicKey.slice(1),
      network,
    });
    const tapRootAddress = p2trInstance.address;
    addresses['P2TR'] = tapRootAddress;
  } else if (network === networks.testnet) {
    addresses['P2PKH'] = address.toBase58Check(hash, 111);

    const result = payments.p2sh({
      redeem: payments.p2wpkh({ pubkey: bufferPublicKey, network }),
    });
    addresses['P2SH-P2WPKH'] = result.address;

    addresses['P2WPKH'] = address.toBech32(hash, 0, 'tb');

    const p2trInstance = payments.p2tr({
      internalPubkey: bufferPublicKey.slice(1),
      network,
    });
    const tapRootAddress = p2trInstance.address;
    addresses['P2TR'] = tapRootAddress;
  }

  console.log('addresses...', addresses);
  if (scriptType) {
    return addresses[scriptType];
  }

  return addresses;
}
