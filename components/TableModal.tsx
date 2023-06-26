import React, { FC, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Backdrop,
  Fade,
  makeStyles,
} from '@material-ui/core';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  votersInfo: any[];
}
interface TableDataType {
  id: number;
  address: any;
  answer: string;
}
const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: '#287f8d',
    borderRadius: '10px',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    border: '0px',
    outline: '0px',
    [theme.breakpoints.down('sm')]: {
      width: '90%',
    },
    [theme.breakpoints.up('md')]: {
      width: '50%',
    },
  },
  table: {
    minWidth: 650,
    [theme.breakpoints.only('xs')]: {
      minWidth: '100%',
    },
  },
  headRow: {
    backgroundColor: '#92d5e1',
    color: 'gray',
    textTransform: 'uppercase',
    fontSize: '0.875rem',
    [theme.breakpoints.only('xs')]: {
      fontSize: '0.75rem',
    },
  },
}));
const TableModal: FC<TableModalProps> = ({ isOpen, onClose, votersInfo }) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  useEffect(() => {
    let tempList: TableDataType[] = [];
    votersInfo.map((voters, index) => {
      let answer = '';
      switch (voters.answer) {
        case '0':
          answer = 'Yes';
          break;
        case '1':
          answer = 'No';
          break;
      }
      const temp = { id: index + 1, address: voters.voter, answer: answer };
      tempList.push(temp);
    });
    setTableData(tempList);
  }, [votersInfo]);
  return (
    <Modal
      className={classes.modal}
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <div className={classes.paper}>
          <h3 className="text-lg font-medium text-white ">Voters</h3>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow className={classes.headRow}>
                  <TableCell>ID</TableCell>
                  <TableCell>ADDRESS</TableCell>
                  <TableCell>ANSWER</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {
                  tableData.length > 0 ? (

                    tableData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.id}
                        </TableCell>
                        <TableCell style={{ overflowWrap: 'anywhere', }}>{row.address}</TableCell>
                        <TableCell>{row.answer}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow >
                      <TableCell></TableCell>
                      <TableCell>No Data...</TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Fade>
    </Modal >
  );
};
export default TableModal;