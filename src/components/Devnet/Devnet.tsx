import { useEffect, useState } from 'react';
import { getInstance } from '../../fhevmjs';
import './Devnet.css';
import { Eip1193Provider, ZeroAddress } from 'ethers';
import { ethers } from 'ethers';
import IdMapping from '../../../deployments/IdMapping.json';
import { BrowserProvider } from 'ethers';

const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export type DevnetProps = {
  account: string;
  provider: BrowserProvider;
};

const CONTRACT_ADDRESS = '0x194CDd095358eBAA5FD02913e5220E2cd7600713';

export const Devnet = ({ account, provider }: DevnetProps) => {
  const [contractAddress, setContractAddress] = useState(ZeroAddress);

  const [handleUserID, setHandleUserID] = useState('0');
  const [decryptedBalance, setDecryptedBalance] = useState('???');

  const [handles, setHandles] = useState<Uint8Array[]>([]);
  const [encryption, setEncryption] = useState<Uint8Array>();

  const [inputValue, setInputValue] = useState(''); // Track the input
  const [chosenValue, setChosenValue] = useState('0'); // Track the confirmed value

  const [inputValueAddress, setInputValueAddress] = useState('');
  const [chosenAddress, setChosenAddress] = useState('0x');
  const [errorMessage, setErrorMessage] = useState('');

  const [decryptedSecret, setDecryptedResult] = useState('???');
  const [counter, setCounter] = useState(0); // useful trick to make the refresh of decryption state work, otherwise contract call will not work correctly (because provider's state won't be updated without a React re-rendering)

  const instance = getInstance();

  useEffect(() => {
    const loadData = async () => {
      try{
        let IdMapping = await import(
          '../../../deployments/IdMapping.json')
         
          console.log(
            `Using ${IdMapping.address} for the token address on Sepolia`,
          );
        

        setContractAddress(IdMapping.address);
      } catch (error) {
        console.error(
          'Error loading data - you probably forgot to deploy the token contract before running the front-end server:',
          error,
        );
      }
    };

    loadData();
  }, []);

  const handleConfirmAddress = () => {
    const trimmedValue = inputValueAddress.trim().toLowerCase();
    if (ethers.isAddress(trimmedValue)) {
      // getAddress returns the checksummed address
      const checksummedAddress = ethers.getAddress(trimmedValue);
      setChosenAddress(checksummedAddress);
      setErrorMessage('');
    } else {
      setChosenAddress('0x');
      setErrorMessage('Invalid Ethereum address.');
    }
  };

  const generateUserID = async () => {
    if (contractAddress != ZeroAddress) {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        IdMapping.abi,
        signer
      );
      console.log(contract)
      const tx = await contract.connect(signer).generateId();

      await tx.wait();

      setHandleUserID(handleUserID.toString());
    }
  };

  return (
    <div>
      <p>User Account: {account}</p>
      <div>
        <button 
          onClick={generateUserID}
          disabled={contractAddress === ZeroAddress}
        >
          Generate User ID
        </button>
        <p>Generated User ID: {handleUserID}</p>
      </div>
    </div>
  );
};
