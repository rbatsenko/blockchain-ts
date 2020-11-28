import SHA256 from "crypto-js/sha256";

type PublicBlock = {
  blockState: {
    index: number;
    timestamp: string;
    hash: string;
    previousHash: string;
    data: any;
  };
  calculateHash: () => string;
  recalculateHash: () => void;
  setPreviousHash: (newPreviousHash: string) => void;
}

function Block(index: number, timestamp: string, data: Object, previousHash = ""): PublicBlock {
  const blockState = {
    index,
    timestamp,
    hash: calculateHash(),
    previousHash,
    dataValue: data,
    get data() {
      return this.dataValue;
    },
    set data(v) {
      this.dataValue = v;
      this.hash = recalculateHash();
    }
  }

  function calculateHash() {
    return SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();
  }

  function recalculateHash() {
    return SHA256(blockState.index + blockState.previousHash + blockState.timestamp + JSON.stringify(blockState.data)).toString();
  }

  function setPreviousHash(newPreviousHash: string) {
    blockState.previousHash = newPreviousHash;
  }

  return {
    blockState,
    calculateHash,
    recalculateHash,
    setPreviousHash,
  };
}

function Blockchain() {
  const chain = [createGenesisBlock()];

  function createGenesisBlock() {
    return Block(0, "01/01/2020", "Genesis block", "0");
  }

  const getLatestBlock = () => chain[chain.length - 1];

  function addBlock(newBlock: PublicBlock) {
    newBlock.setPreviousHash(getLatestBlock().blockState.hash);
    newBlock.recalculateHash();
    chain.push(newBlock);
  }

  function isChainValid() {
    let isValid = true;
    const [, ...chainWithoutFirstBlock] = chain;

    chainWithoutFirstBlock.forEach((currentBlock, index) => {
      const previousBlock = chain[index];

      if (currentBlock.blockState.hash !== currentBlock.calculateHash()) {
        console.log("hash");
        isValid = false;
      }

      if (currentBlock.blockState.previousHash !== previousBlock.blockState.hash) {
        isValid = false;
      }
    });

    return isValid;
  }

  return {
    addBlock,
    chain,
    isChainValid,
  }
}

const myCoin = Blockchain();
myCoin.addBlock(Block(1, "10/07/2020", { amount: 4 }));
myCoin.addBlock(Block(2, "12/07/2020", { amount: 10 }));

console.log(myCoin.chain);

console.log("Is blockchain valid? ", myCoin.isChainValid());

myCoin.chain[1].blockState.data = { amount: 100 };

console.log("Is blockchain valid? ", myCoin.isChainValid());

console.log(JSON.stringify(myCoin, null, 4));