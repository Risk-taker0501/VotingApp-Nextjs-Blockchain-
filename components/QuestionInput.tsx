import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, makeStyles, Grid } from '@material-ui/core';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
    onClose: () => void;
    onSubmit: (question: string, miniAmount: string, date: number, period: string) => void;
}

const useStyles = makeStyles((theme) => ({
    blueButton: {
        backgroundColor: "#eca13c",
        color: 'white',
        "&:hover": {
            backgroundColor: "rgba(26, 167, 213, 0.7)",
        },
    },
    paper: {
        [theme.breakpoints.down("sm")]: {
            margin: 0,
            width: '100%',
        },
    },
}));

const QuestionInput: React.FC<Props> = ({ onClose, onSubmit }) => {
    const classes = useStyles();
    const [question, setQuestion] = useState('');
    const [miniAmount, setMiniAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const handleQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(event.target.value);
    };
    const handleMiniAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMiniAmount(event.target.value);
    };
    const handleSave = () => {
        if (selectedDate) {
            onSubmit(question, miniAmount, parseInt((selectedDate.getTime() / 1000).toString()), selectedPeriod);
            onClose();
        }
    };
    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm" classes={{ paper: classes.paper }}>
            <DialogTitle>Add a New Question</DialogTitle>
            <DialogContent>
                <Grid container direction="column" alignItems="stretch" spacing={2}>
                    <Grid item>
                        <TextField
                            id="question"
                            label="Question"
                            multiline
                            minRows={4}
                            variant="outlined"
                            fullWidth
                            value={question}
                            onChange={handleQuestionChange}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="miniAmount"
                            label="Mini Amount"
                            type="number"
                            variant="outlined"
                            fullWidth
                            value={miniAmount}
                            onChange={handleMiniAmountChange}
                        />
                    </Grid>
                    <Grid item>
                        <label htmlFor="date-picker">Date and Time</label>
                        <DatePicker
                            id="date-picker"
                            selected={selectedDate}
                            onChange={(date: Date) => setSelectedDate(date)}
                            showTimeSelect
                            dateFormat="yyyy/MM/dd hh:mm aa"
                            className="border border-gray-400 px-2 py-1 rounded h-14 focus:border-blue-500 focus:outline-none"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="period-input"
                            label="Period"
                            type="number"
                            variant="outlined"
                            fullWidth
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" className={classes.blueButton} onClick={handleSave}>
                    Save
                </Button>
                <Button variant="contained" color="default" onClick={onClose} style={{ marginRight: '16px' }}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default QuestionInput;