import MainTable from "../../components/MainTable";
import styles from '../../styles/Home.module.css'
import { NextPage } from "next";
import TableModal from "../../components/TableModal";
import { useEffect, useState } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import Web3 from "web3";
import contract from '../../contracts/BallotSystem.json';
import Button from "@material-ui/core/Button";
import { useRouter } from "next/router";
import Image from "next/image";

const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
const RPC_URL = process.env.RPC_URL ?? "";
const API_URL = process.env.API_URL ?? "";
const chainId = Number(process.env.CHAIN_ID ?? 0);

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

import localFont from '@next/font/local'


const wheaton = localFont({
  src: '../wheaton-capitals.ttf',
  variable: '--wheaton-capitals',
})

const MyPage: NextPage = () => {
  const [tableModalVisible, setTableModalVisible] = useState<boolean>(false);
  const web3Infura = new Web3(API_URL);
  const ballotContract = new web3Infura.eth.Contract(contract.abi as any, contractAddress);
  const [rows, setRows] = useState<Row[]>([]);
  const [allQuestList, setAllQuestList] = useState<any[]>([]);
  const [selectedVoters, setSelectedVoters] = useState<any[]>([]);
  const router = useRouter();

  const getQuestionList = async () => {
    try {
      let questList = await ballotContract.methods.getAllBallots().call();
      console.log(questList);
      const tempQuestion = questList.filter((quest: any) => quest.state == '1' && Number(quest.startTime) * 1000 < new Date().getTime() && new Date().getTime() < Number(quest.startTime) * 1000 + (Number(quest.period)) * 1000);
      setAllQuestList(questList);
      let tmpList: any[] = [];
      questList.map((quest: any, index: number) => {
        let status = "";
        switch (quest.state) {
          case "0":
            status = 'Created';
            break;
          case "1":
            status = 'Voting';
            break;
          case "2":
            status = 'Ended';
            break;
        }
        if (quest.state == "1") {
          if (tempQuestion[0] == undefined) {
            status = "Ended";
          }
          else {
            if (quest.id != tempQuestion[0].id) {
              status = "Ended";
            }
          }
        }
        if (quest.state == '1' && new Date().getTime() < Number(quest.startTime) * 1000 + (Number(quest.period)) * 1000) {
          status = "Created";
        }
        if (quest.state == '1' && Number(quest.startTime) * 1000 < new Date().getTime() && new Date().getTime() < Number(quest.startTime) * 1000 + (Number(quest.period)) * 1000) {
          status = "Voting";
        }
        const temp = { id: index + 1, Question: quest.question, Yes: Number(quest.yes) / 10 ** 18, No: Number(quest.no) / 10 ** 18, Voters: quest.voters.length, Status: status, allVoters: quest.voters }
        tmpList.push(temp);
      })
      setRows(tmpList);
    } catch (err) {
      alert(err);
      console.log(err);
    }
  }

  useEffect(() => {
    getQuestionList();
  }, [])

  const tableHandle = (rowId: number) => {
    setSelectedVoters(allQuestList[rowId].voters);
    setTableModalVisible(true);
  }


  const handleGoToPage = () => {
    router.push({ pathname: 'votingpage' });
  };


  return (
    <div className={styles.bgImage}>
      <div className={styles.logoContainer}>
        <Image src="/logoz.png" alt="Logo" width={150} height={50} className={styles.logo} />
      </div>
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.connectBtnContainer} style={{ color: 'white' }}>
            <Button variant="contained" color="primary" onClick={handleGoToPage} className={styles.buttonStyle}>
              Back to vote
            </Button>
          </div>
          <h1 className={`${styles.title} ${wheaton.className}`}>
            Welcome to TWDO Voting
            <p className={`${styles.description} ${wheaton.className}`} style={{ color: "black" }}>Our blockchain voting platform provides secure, transparent, and user-friendly voting while maintaining privacy and anonymity, resulting in increased trust and voter confidence.</p>
          </h1>
          {
            rows.length > 0 && (
              <MainTable data={rows} tableHandle={tableHandle} />
            )
          }
        </div>
        <TableModal isOpen={tableModalVisible} onClose={() => setTableModalVisible(false)} votersInfo={selectedVoters} />
      </div>
    </div >
  );
};



export default MyPage;