import { constants } from '../constants';
import { combineReducers } from 'redux';

function alert(state = {}, action) {
    switch (action.type) {
      case constants.SETARR:
        return {
          buf: action.payload.buf
        };
      default:
        return state
    }
  }

  function wallet(state = {}, action) {
    switch (action.type) {
      case constants.SETWALLETADDRESS:
        return {
          address: action.payload.address
        };
      default:
        return state
    }
  }

const info = combineReducers({
    alert,
    wallet
});

export default info;