const moment = require("moment");

const hasNotExpired = (nonISOString) => {
    if (nonISOString) {
        const enteredTime = moment(nonISOString, "yyyy-MM-dd HH:mm:ss.SSS");
        const currentTime = moment();
        return currentTime.isBefore(enteredTime);
    } else {
        return null;
    }
};

module.exports = {hasNotExpired};