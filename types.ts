type Row = {
    id: number;
    Question: string;
    Yes: number;
    No: number;
    Status: string;
    Voters: number;
    allVoters:any[];
  };

type TableProps = {
    data: Row[];
    tableHandle?:any;
};

type TableState = {
selectedRows: Row[];
};