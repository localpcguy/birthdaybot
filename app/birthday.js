class Birthday {
    name;
    monthName;
    month;
    day;
    isActive;

    get birthdate() {
        const today = new Date();
        return new Date(today.getFullYear(), this.month - 1, this.day);
    }

    isToday() {
        const today = new Date();
        return today.getMonth() + 1 === this.month && today.getDate() === this.day;
    }

    isNextWeek() {
        const today = new Date();
        const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        return this.birthdate.getTime() >= today.getTime() && this.birthdate.getTime() <= weekEnd.getTime();
    }

    isNextMonth() {
        const today = new Date();
        const monthEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
        return this.birthdate.getTime() >= today.getTime() && this.birthdate.getTime() <= monthEnd.getTime();
    }

    deserialize(input) {
        this.name = input[0];
        this.monthName = input[1];
        this.month = input[2] * 1;
        this.day = input[3] * 1;
        this.isActive = input[4] && input[4].toLowerCase() === 'yes';

        return this;
    }
}

module.exports = {
    Birthday: Birthday
};
