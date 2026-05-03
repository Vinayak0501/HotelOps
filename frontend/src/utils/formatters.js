// Formatiing date into readable time string
// new Date(date) --> converting date (could be a timestamp/string/already a date) -> to JS date object
// toLocaleTimeString --> converts Date to time string --> based on user's locale (region)
export function formatTime(date){

    if(!date){
        return '-';
    }

    return new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// converting date into readable date string
export function formatDate(date){

    if(!date){
        return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: "numeric"
    });
}


// long form of date --> along with day
export function formatDateLong(date){

    if(!date){
        return '-';
    }

    return new Date(date).toLocaleDateString('en-IN', {

        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'

    });
}


// get initials of user's name to create an avatar for logo without any dp
export function getInitials(name = ''){

    return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

}

// in DB ==> priority stored as number (3/2/1) --> convert them to string form
export function getPriorityLabel(priority){

    if(priority === 3) return 'Checkout';
    if(priority === 2) return 'Occupied';
    return 'Vacant';

}


export function getPriorityEmoji(priority){

    if (priority === 3) return '🔴';
    if (priority === 2) return '🟡';
    return '🔵';

}


export function getCompletionRate(completed, total){

    if(!total){
        return 0;
    }

    return Math.round((completed/total) * 100);
    
}


// convert minutes to hours
export function minutesToHours(mins){

    if(!mins){
        return '0m';
    }

    const h = Math.floor(mins/60);
    const m = mins % 60;

    if(h == 0){
        return `${m}m`;
    }

    if(m == 0){
        return `${h}h`;
    }

    return `${h}h ${m}m`;
}