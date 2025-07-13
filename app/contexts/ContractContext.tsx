import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { storage, storageKeys } from '../utils/storage';

interface Contract {
  id: string;
  name: string;
  analysisDate: string;
  complianceScore: number;
  sessionId: string;
  data?: any;
  interactions?: number;
  modifications?: number;
  hasGeneratedContract?: boolean;
  fileSize?: string;
  lastViewed?: string;
}

interface ContractContextType {
  contracts: Contract[];
  addContract: (contract: Contract) => Promise<void>;
  removeContract: (id: string) => Promise<void>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
  getContract: (id: string) => Contract | undefined;
  clearContracts: () => Promise<void>;
  isLoading: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setIsLoading(true);
      const storedContracts = await storage.getItemAsync('contracts_data');
      if (storedContracts) {
        setContracts(JSON.parse(storedContracts));
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContracts = async (contractsToSave: Contract[]) => {
    try {
      await storage.setItemAsync('contracts_data', JSON.stringify(contractsToSave));
    } catch (error) {
      console.error('Failed to save contracts:', error);
    }
  };

  const addContract = async (contract: Contract) => {
    try {
      const updatedContracts = [contract, ...contracts];
      setContracts(updatedContracts);
      await saveContracts(updatedContracts);
    } catch (error) {
      console.error('Failed to add contract:', error);
    }
  };

  const removeContract = async (id: string) => {
    try {
      const updatedContracts = contracts.filter(c => c.id !== id);
      setContracts(updatedContracts);
      await saveContracts(updatedContracts);
    } catch (error) {
      console.error('Failed to remove contract:', error);
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      const updatedContracts = contracts.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      setContracts(updatedContracts);
      await saveContracts(updatedContracts);
    } catch (error) {
      console.error('Failed to update contract:', error);
    }
  };

  const getContract = (id: string): Contract | undefined => {
    return contracts.find(c => c.id === id);
  };

  const clearContracts = async () => {
    try {
      setContracts([]);
      await storage.deleteItemAsync('contracts_data');
    } catch (error) {
      console.error('Failed to clear contracts:', error);
    }
  };

  return (
    <ContractContext.Provider value={{
      contracts,
      addContract,
      removeContract,
      updateContract,
      getContract,
      clearContracts,
      isLoading
    }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

export default ContractProvider;