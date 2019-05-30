import TimeSpinner from '../timespinner/TimeSpinner';

export default {
    name: 'DateTimeSpinner',
    extends: TimeSpinner,
    props: {
        selections: {
            type: Array,
            default: () => [[0,2],[3,5],[6,10],[11,13],[14,16],[17,19]]
        },
        format: {
            type: String,
            default: 'MM/dd/yyyy HH:mm'
        }
    }
}