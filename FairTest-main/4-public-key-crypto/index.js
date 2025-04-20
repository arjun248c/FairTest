"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const tweetnacl_util_1 = require("tweetnacl-util");
const keypair = web3_js_1.Keypair.generate();
const message = "The attack will happen at xyz";
const messageBytes = (0, tweetnacl_util_1.decodeUTF8)(message);
const signature = tweetnacl_1.default.sign.detached(messageBytes, keypair.secretKey);
console.log(signature);
const result = tweetnacl_1.default.sign.detached.verify(messageBytes, signature, keypair.publicKey.toBytes());
console.log(result);
