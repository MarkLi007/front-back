import { ethers } from "ethers";

// Complete ABI from the contract - this is the full ABI provided in the custom instructions
const abi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			},
			{
				"internalType": "uint256[]",
				"name": "_references",
				"type": "uint256[]"
			}
		],
		"name": "addVersion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"internalType": "enum PaperRegistryRealistic.Role",
				"name": "_newRole",
				"type": "uint8"
			}
		],
		"name": "assignRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_auditor",
				"type": "address"
			}
		],
		"name": "addAuditor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_auditor",
				"type": "address"
			}
		],
		"name": "removeAuditor",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_author",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			},
			{
				"internalType": "uint256[]",
				"name": "_references",
				"type": "uint256[]"
			}
		],
		"name": "submitPaper",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "approvePaper",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "rejectPaper",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			}
		],
		"name": "removePaper",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "_fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "_signature",
				"type": "bytes"
			},
			{
				"internalType": "uint256[]",
				"name": "_references",
				"type": "uint256[]"
			}
		],
		"name": "getPaperInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "paperOwner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "author",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "versionCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_paperId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_verIndex",
				"type": "uint256"
			}
		],
		"name": "getVersion",
		"outputs": [
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "bytes32",
				"name": "fileHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			},
			{
				"internalType": "uint256[]",
				"name": "references",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paperCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Updated contract address for Sepolia testnet
const contractAddress = "0x1fdd9b748d0a341cceb2336d979ffabce369e71d";

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask");
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, abi, signer);
}

export async function getContractReadOnly() {
  if (!window.ethereum) {
    // If MetaMask is not available, connect to a public RPC endpoint
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    return new ethers.Contract(contractAddress, abi, provider);
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(contractAddress, abi, provider);
}

export enum PaperStatus {
  PENDING = 0,
  PUBLISHED = 1,
  REJECTED = 2,
  REMOVED = 3
}

export enum Role {
  NONE = 0,
  ADMIN = 1,
  REVIEWER = 2,
  AUTHOR = 3
}

// Update the ReportType enum to match what's expected in the components
export enum ReportType {
  PLAGIARISM = 0,  // This corresponds to FRAUD in the components
  FALSIFICATION = 1, // This corresponds to DUPLICATE in the components
  COPYRIGHT_VIOLATION = 2, // This corresponds to INACCURACY in the components
  OTHER = 3
}

export function mapStatusToString(status: number): string {
  switch (status) {
    case PaperStatus.PENDING: return "待审核";
    case PaperStatus.PUBLISHED: return "已发布";
    case PaperStatus.REJECTED: return "已驳回";
    case PaperStatus.REMOVED: return "已删除";
    default: return "未知状态";
  }
}

export function mapRoleToString(role: number): string {
  switch (role) {
    case Role.NONE: return "普通用户";
    case Role.ADMIN: return "管理员";
    case Role.REVIEWER: return "审稿人";
    case Role.AUTHOR: return "作者";
    default: return "未知角色";
  }
}

export function mapReportTypeToString(reportType: number): string {
  switch (reportType) {
    case ReportType.PLAGIARISM: return "抄袭";
    case ReportType.FALSIFICATION: return "数据造假";
    case ReportType.COPYRIGHT_VIOLATION: return "版权侵犯";
    case ReportType.OTHER: return "其他问题";
    default: return "未知类型";
  }
}
