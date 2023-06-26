import { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import { grey } from "@material-ui/core/colors";
import { useSelector } from "react-redux";


const useStyles = makeStyles({
  root: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '4px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  title: {
    width: '100%',
    backgroundColor: "#1a6b8d",
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '4px 4px 0 0',
    padding: '8px',
    fontSize: '18px',
  },
  tableRoot: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: '100%',
    backgroundColor: 'white',
  },
  headRow: {
    backgroundColor: '#92d5e1',
    color: 'gray',
    textTransform: 'uppercase',
    fontSize: '0.875rem',
  },
  bodyRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: grey[200],
    },
  },
  cell: {
    padding: '16px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  button: {
    width: "100%",
    margin: "0 auto",
    marginBottom: "8px",
    "&.Mui-disabled": {
      backgroundColor: grey[400],
    },
  },
  greenButton: {
    backgroundColor: "#508b50",
    color: 'white',
    "&:hover": {
      backgroundColor: "rgba(80, 139, 80, 0.7)",
    },
  },
  blueButton: {
    backgroundColor: "#eca13c",
    color: 'white',
    "&:hover": {
      backgroundColor: "rgba(26, 167, 213, 0.7)",
    },
  },
  greyButton: {
    backgroundColor: grey[500],
  },
});



const MainTable: React.FC<TableProps> = ({ data, tableHandle }) => {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = useState<Row[]>([]);
  const ownerAddress = "0x261ab5E7b2fc81FF04FdD19bF8D3f2b1bfcB5dAF";
  let viewData = data;
  const { address } = useSelector((state: any) => state.info.wallet);
  console.log(address);

  const handleSelectRow = (row: Row) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };


  return (
    <Box className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="h6">Vote Table</Typography>
      </Box>
      <Box className={classes.tableRoot}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow className={classes.headRow}>
              {Object.keys(viewData[0]).map((key, index) => {
                if (key !== 'allVoters') {
                  return (
                    <TableCell key={index} className={classes.cell}>
                      {key}
                    </TableCell>
                  );
                }
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              // ...rest of your row logic
              if (row.Status != "Created" || address == ownerAddress) {
                return (
                  <TableRow
                    key={index}
                    className={`${classes.bodyRow} ${selectedRows.includes(row) ? 'bg-blue-200' : ''}`}
                    onClick={() => handleSelectRow(row)}
                  >
                    {Object.values(row).map((value, i) => {
                      if (i !== 6) {
                        return (
                          <TableCell
                            key={i}
                            className={classes.cell}
                            onClick={() => {
                              if (i === 4) {
                                tableHandle(index)
                              }
                            }}
                          >
                            {value}
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                );
              }
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default MainTable;