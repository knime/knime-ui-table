export const defaultTimeFilter = 'All time';

export const checkTimeFilter = (inDateString, timeFilterConfig) => {
    try {
        let now = new Date();
        let utcDateTime = inDateString.split('.')[0];
        // date instance
        let di = new Date(utcDateTime);
        // if date is "InvalidDate", return default
        if (!(di instanceof Date) || isNaN(di)) {
            return true;
        }
        let timeBoundsMs = now[timeFilterConfig.setFn](now[timeFilterConfig.getFn]() - timeFilterConfig.val);
        return di - timeBoundsMs >= 0;
    } catch (err) {
        return true;
    }
};

export const tableTimeFilters = {
    'Last day': {
        getFn: 'getDate',
        setFn: 'setDate',
        val: 1
    },
    'Last week': {
        getFn: 'getDate',
        setFn: 'setDate',
        val: 7
    },
    'Last month': {
        getFn: 'getMonth',
        setFn: 'setMonth',
        val: 1
    },
    'Last 3 months': {
        getFn: 'getMonth',
        setFn: 'setMonth',
        val: 3
    },
    'Last 6 months': {
        getFn: 'getMonth',
        setFn: 'setMonth',
        val: 6
    },
    'Last year': {
        getFn: 'getYear',
        setFn: 'setYear',
        val: 1
    },
    'All time': {}
};

export const months = {
    '1': 'Jan.',
    '2': 'Feb.',
    '3': 'Mar.',
    '4': 'Apr.',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'Aug.',
    '9': 'Sept.',
    '10': 'Oct.',
    '11': 'Nov.',
    '12': 'Dec.'
};
