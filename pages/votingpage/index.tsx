import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import { Typography } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import styles from '../../styles/Home.module.css';
import Grid from '@material-ui/core/Grid';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Image from "next/image";
import localFont from '@next/font/local';
import { constants } from "../../redux/constants";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers, providers } from "ethers";
import Web3Modal from "web3modal";
import Web3 from "web3";
import contract from '../../contracts/BallotSystem.json';
import { NextPage } from 'next';
import QuestionInput from '../../components/QuestionInput';


const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
const RPC_URL = process.env.RPC_URL ?? "";
const API_URL = process.env.API_URL ?? "";
const chainId = Number(process.env.CHAIN_ID ?? 0);

const wheaton = localFont({
    src: '../wheaton-capitals.ttf',
    variable: '--wheaton-capitals',
})

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                chainId: RPC_URL,
            }
        }
    }
}

let web3Modal: Web3Modal;
if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions
    })
}

const VotingPage: NextPage = () => {
    const router = useRouter();
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const web3Infura = new Web3(API_URL);
    const ballotContract = new web3Infura.eth.Contract(contract.abi as any, contractAddress);
    const [provider, setProvider] = useState(null);
    const dispatch = useDispatch();
    const [ownerAddr, setOwnerAddr] = useState("");
    const { address } = useSelector((state: any) => state.info.wallet);
    const [votingQuestion, setVotingQuestion] = useState<any>("none");
    const [addQuestionClicked, setAddQuestionClicked] = useState<boolean>(false);
    const [endQuestionClicked, setEndQuestionClicked] = useState<boolean>(false);
    const [isQuestionInputOpen, setIsQuestionInputOpen] = useState<boolean>(false);
    const [answerClicked, setAnswerClicked] = useState<boolean>(false);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);

    useEffect(() => {
        getQuestionList();
    }, [])


    const balanceStr = (val: string) => {
        let balETH = ethers.utils.formatUnits(val, "ether");
    }

    const answerHandle = async (answer: string) => {
        try {
            setAnswerClicked(true);
            let provider = await web3Modal.connect();
            if (provider == null) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const network = await ethersProvider.getNetwork();
            const chainIdBuf = network.chainId;
            if (!(chainIdBuf === chainId)) {
                if (ethersProvider.provider.request) {
                    await ethersProvider.provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + chainId.toString(16) }],
                    });
                }
            }
            const signer = await ethersProvider.getSigner();
            const bContract = new ethers.Contract(contractAddress, contract.abi, signer);
            let nftTxn = await bContract.vote(votingQuestion.id, answer);
            await nftTxn.wait();
            getQuestionList();
            alert("success");
            setAnswerClicked(false);
        } catch (err) {
            console.log(err);
            alert(err);
            setAnswerClicked(false);
        }
    }

    const getQuestionList = async () => {
        try {
            let questList = await ballotContract.methods.getAllBallots().call();
            const ownderAddress = await ballotContract.methods.chairperson().call();
            if (address == ownderAddress) {
                setIsOwner(true);
            }
            setOwnerAddr(ownderAddress);
            dispatch({ type: constants.SETARR, payload: { buf: questList } });
            const temp = questList.filter((quest: any) => quest.state == '1' && Number(quest.startTime) * 1000 < new Date().getTime() && new Date().getTime() < Number(quest.startTime) * 1000 + (Number(quest.period)) * 1000);
            if (temp.length > 0) {
                setVotingQuestion(temp[0]);
                if ((temp[0].voters.filter((e: any) => e.voter == address).length > 0)) {
                    setIsAnswered(true);
                }
            }
            else {
                setVotingQuestion("none");
            }
        } catch (err) {
            alert(err);
            console.log(err);
        }
    }

    const connectWallet = async () => {
        try {
            let provider = await web3Modal.connect();
            if (provider == null) return;
            const ethersProvider = new providers.Web3Provider(provider);
            // add listener
            provider.on("accountsChanged", async () => {
                const signer = await ethersProvider.getSigner();
                const userAddress = await signer.getAddress();
                dispatch({ type: constants.SETWALLETADDRESS, payload: { address: userAddress } });
                const userBal = await signer.getBalance();
                balanceStr(userBal.toString());
                setIsConnected(true);
                localStorage.setItem('userAddress', userAddress);
                if (userAddress == ownerAddr) {
                    setIsOwner(true);
                }
            });
            // switch network
            const network = await ethersProvider.getNetwork();
            const chainIdBuf = network.chainId;
            if (!(chainIdBuf === chainId)) {
                if (ethersProvider.provider.request) {
                    await ethersProvider.provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + chainId.toString(16) }],
                    });
                }
            }
            // get wallet info
            const signer = await ethersProvider.getSigner();
            const userAddress = await signer.getAddress();
            dispatch({ type: constants.SETWALLETADDRESS, payload: { address: userAddress } });
            const userBal = await signer.getBalance();
            balanceStr(userBal.toString());
            setIsConnected(true);
            localStorage.setItem('userAddress', userAddress);
            if (userAddress == ownerAddr) {
                setIsOwner(true);
            }
            setProvider(provider);
        } catch (err) {
            console.log(err);
        }
    }

    const addQuestionSubmit = async (question: string, miniAmount: string, startDate: number, period: string) => {
        try {
            setAddQuestionClicked(true);
            if (provider == null) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const network = await ethersProvider.getNetwork();
            const chainIdBuf = network.chainId;
            if (!(chainIdBuf === chainId)) {
                if (ethersProvider.provider.request) {
                    await ethersProvider.provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + chainId.toString(16) }],
                    });
                }
            }
            const signer = await ethersProvider.getSigner();
            const bContract = new ethers.Contract(contractAddress, contract.abi, signer);
            let nftTxn = await bContract.createBallot(question, ethers.utils.parseEther(miniAmount + ""), startDate, period);
            await nftTxn.wait();
            getQuestionList();
            alert("success");
            setAddQuestionClicked(false);
        }
        catch (err) {
            console.log(err);
            alert(err);
            setAddQuestionClicked(false);
        }
    };

    const endQuestionSubmit = async () => {
        try {
            setEndQuestionClicked(true);
            if (provider == null) return;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const network = await ethersProvider.getNetwork();
            const chainIdBuf = network.chainId;
            if (!(chainIdBuf === chainId)) {
                if (ethersProvider.provider.request) {
                    await ethersProvider.provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x" + chainId.toString(16) }],
                    });
                }
            }
            const signer = await ethersProvider.getSigner();
            const bContract = new ethers.Contract(contractAddress, contract.abi, signer);
            let nftTxn = await bContract.endVote(votingQuestion.id);
            await nftTxn.wait();
            getQuestionList();
            alert("success");
            setEndQuestionClicked(false);
        }
        catch (err) {
            console.log(err);
            alert(err);
            setEndQuestionClicked(false);
        }
    };
    const handleGoToTablePage = () => {
        router.push('../mypage');
    };
    return (
        <div className={styles.bgImage} style={{ position: 'relative' }}>
            <div className={styles.logoContainer}>
                <Image src="/logoz.png" alt="Logo" width={150} height={50} className={styles.logo} />
            </div>
            <div className={styles.connectBtnContainer} style={{ color: 'white' }}>
                {
                    address != undefined ? (
                        <Typography variant="subtitle1" className={styles.address}>
                            <span className={styles.addressSubstring}>
                                {address.substring(0, 6)}
                            </span>
                            <span>...</span>
                            <span className={styles.addressSubstring}>
                                {address.substring(address.length - 4)}
                            </span>
                        </Typography>
                    ) : (
                        <Button variant="contained" color="primary" onClick={connectWallet} className={styles.buttonStyle}>
                            Connect Wallet
                        </Button>
                    )
                }
            </div>
            <div className={styles.votingPageContainer} style={{ boxShadow: "none" }}>
                <Paper className={styles.votingPaper} style={{ boxShadow: "none", background: "#86cad8" }}>
                    <Grid container alignItems="center" className={styles.header} style={{ background: "#86cad8" }}>
                        <Grid item>
                            <Typography style={{ textAlign: "center", marginBottom: "0", color: "#fff", display: "block", fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'" }} variant="h1" className={`${styles.votingTitle} ${wheaton.className}`}>
                                TWDO
                            </Typography>
                            <Typography style={{ textAlign: "center", fontSize: "60px", color: "black", marginBottom: "0", display: "block", fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'", marginTop: "-15px" }} variant="h1" className={`${styles.votingTitle} ${wheaton.className}`}>
                                CONGRESS
                            </Typography>
                            <p style={{ marginTop: "-10px", fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'" }}>EMPOWERING THE COMMUNITY, ONE VOTE AT THE TIME.</p>
                        </Grid>
                        <Grid item></Grid>
                    </Grid>
                    <div className={styles.contentSection}>
                        {votingQuestion == undefined || votingQuestion == "none" ? (
                            isOwner ? (
                                <div>
                                    <Button variant="contained" className={styles.yellowButton} disabled={addQuestionClicked} onClick={() => (setIsQuestionInputOpen(true))}>
                                        {addQuestionClicked ? 'Loading...' : 'Create new question'}
                                    </Button>
                                    {isQuestionInputOpen && <QuestionInput onClose={() => setIsQuestionInputOpen(false)} onSubmit={addQuestionSubmit} />}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography variant="body2" style={{ fontSize: '1.5rem', fontStyle: 'italic', fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'" }}>
                                        There is no voting question
                                    </Typography>
                                </div>
                            )
                        ) : (
                            <div>
                                <div className={styles.fieldGroup}>
                                    <Typography variant="body1" className={styles.fieldLabel}>
                                        Question:
                                    </Typography>
                                    <Typography variant="body2">
                                        {votingQuestion.question}
                                    </Typography>
                                </div>
                                <div className={styles.timeGroup}>
                                    <Grid container justifyContent='space-between' >
                                        <Grid item className={styles.timeField}>
                                            <Typography variant="body1" className={styles.fieldLabel}>
                                                Start Time:
                                            </Typography>
                                            <Typography variant="body2">{new Date(Number(votingQuestion.startTime) * 1000).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}</Typography>
                                        </Grid>
                                        <Grid item className={styles.timeField}>
                                            <Typography variant="body1" className={styles.fieldLabel}>
                                                End Time:
                                            </Typography>
                                            <Typography variant="body2">{new Date(Number(votingQuestion.startTime) * 1000 + (Number(votingQuestion.period)) * 1000).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}</Typography>
                                        </Grid>
                                    </Grid>
                                </div>
                                {

                                    isOwner ? (
                                        <Grid container className={styles.answerGroup}>
                                            <Button variant="contained" className={styles.yellowButton} disabled={endQuestionClicked} onClick={endQuestionSubmit}>
                                                {endQuestionClicked ? 'Loading...' : 'End voting'}
                                            </Button>
                                        </Grid>
                                    ) : (!isAnswered ? (
                                        <Grid container className={styles.answerGroup}>
                                            <Grid item className={styles.commonButton}>
                                                <Button
                                                    variant="contained"
                                                    className={styles.yellowButton}
                                                    disabled={answerClicked || !isConnected}
                                                    onClick={() => answerHandle("0")}
                                                >
                                                    {answerClicked ? 'Waiting...' : 'Yes'}
                                                </Button>
                                            </Grid>
                                            <Grid item className={styles.commonButton}>
                                                <Button
                                                    variant="contained"
                                                    className={styles.yellowButton}
                                                    disabled={answerClicked || !isConnected}
                                                    onClick={() => answerHandle("1")}
                                                >
                                                    {answerClicked ? 'Waiting...' : 'No'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Grid container className={styles.answerGroup}>
                                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '10px' }}>
                                                <Typography variant="body2" style={{ fontSize: '1.5rem', fontStyle: 'italic', fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'" }}>
                                                    You&apos;ve already answered.
                                                </Typography>
                                            </div>
                                        </Grid>
                                    )
                                    )
                                }
                            </div>
                        )}
                    </div>
                    <Typography className={styles.descrptionText} style={{ fontSize: "1rem", fontWeight: "450", fontFamily: "'__wheaton_b3a801', '__wheaton_Fallback_b3a801'" }}>This voting system for our project is designed to be inclusive and straightforward. Any verified holder with more than 1000 TWDO coins is eligible to participate in voting process.
                        Each token owned counts as one vote, which can be used to approve or disapprove the proposals put forth by the team.
                        This ensures that our community plays an active role in shaping the future of our project.</Typography>
                </Paper>
            </div>
            <div className={styles.backBtnContainer}>
                <Button variant="contained" color="primary" className={styles.buttonStyle} onClick={handleGoToTablePage}>
                    Previous votes
                </Button>
            </div>
        </div>
    );
};
export default VotingPage;