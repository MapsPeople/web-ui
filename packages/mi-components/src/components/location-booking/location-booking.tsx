import { Component, ComponentInterface, Host, h, Prop, Watch, State, Event, EventEmitter } from '@stencil/core';
import { JSX } from '@stencil/core/internal';
import addMinutes from 'date-fns/addMinutes';
import addDays from 'date-fns/addDays';
import parse from 'date-fns/parse';
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping';
import { isInternetExplorer } from '../../utils/utils';
import { BookingTimeSlot } from '../../types/booking-time-slot';
import { Location } from '@mapsindoors/typescript-interfaces';
import { LocationBookingDuration } from './../../enums/location-booking-duration.enum';

declare const mapsindoors;

@Component({
    tag: 'mi-location-booking',
    styleUrl: 'location-booking.scss',
    shadow: true
})
export class LocationBooking implements ComponentInterface {

    /**
     * MapsIndoors location to book.
     * @type {Location} MapsIndoors location
     */
    @Prop() location: Location;

    @Watch('location')
    locationChanged(): void {
        this.updateBookings();
    }

    /**
     * Wether booking should be performed for 30 or 60 minutes.
     * @type {LocationBookingDuration}
     */
    @Prop() duration: LocationBookingDuration = LocationBookingDuration.min30;

    @Watch('duration')
    updateDuration(): void {
        if (this.location) {
            this.updateBookings();
        }
    }

    /**
     * Translations object for translatable strings.
     */
    @Prop() translations: {
        book: string;
        cancel: string;
        booked: string;
    } = {
        book: 'Book',
        cancel: 'Cancel',
        booked: 'Booked'
    };

    /**
     * How many time slots to show going forward in time. Default to 4.
     */
    @Prop() show = 4;

    /**
     * No bookings will be allowed before this hour. Default value is 8.
     * @type {number} - the hour in 24h format
     */
    @Prop() startHour = 8;

    /**
     * No bookings will be allowed within and after this hour. Default value is 18.
     * @type {number} - the hour (0-23)
     */
    @Prop() stopHour = 18;

    /**
     * The title of the created bookings. Defaults to "Booked".
     * @type {string}
     */
    @Prop() bookingTitle = 'Booked';

    /**
     * Event fired when booking is completed.
     * @event bookingCompleted
     * @type {EventEmitter}
     */
    @Event() bookingCompleted: EventEmitter<object>;

    /**
     * Event fired in case booking failed.
     * @event bookingFailed
     * @type {EventEmitter}
     */
    @Event() bookingFailed: EventEmitter<Error>;

    /**
     * Event fired when booking is cancelled.
     * @type {EventEmitter}
     */
    @Event() cancelCompleted: EventEmitter<void>;


    /**
     * Event fired in case cancelling failed.
     * @type {EventEmitter}
     */
    @Event() cancelFailed: EventEmitter<Error>;

    /**
     * All time slots that can be presented.
     * @type BookingTimeSlot[]
     */
    @State() timeSlots = [];

    isInternetExplorer: boolean = isInternetExplorer();

    /**
     * Get existing bookings and calculate booking time slots for the location.
     */
    updateBookings(): void {
        this.getBookingsToday()
            .then(bookings => {
                const dayOffset = new Date().getHours() >= this.stopHour ? 1 : 0;
                const timeSlots = this.getTimeSlots(dayOffset);

                // Decorate time slots with booking information
                for (let timeSlot of timeSlots) {
                    timeSlot = this.assignBookingInfoToTimeslot(timeSlot, bookings);
                }

                this.timeSlots = timeSlots;
            })
            .catch(error => {
                this.timeSlots = [];
                console.warn(error); /* eslint-disable-line no-console */
            });
    }

    /**
     * Return an array of time slots for the rest of the day, or if given a day offset, time slots from the start hour.
     * @param {number} daysOffset - number of days from now to generate time slots for.
     * @returns {Object[]} - Array of intervals: { start: Date, end: Date }
     */
    getTimeSlots(daysOffset = 0): BookingTimeSlot[] {
        const now = addDays(new Date(), daysOffset);

        if (daysOffset > 0) {
            now.setHours(0, 0, 0, 0);
        }

        const startHour = Math.max(now.getHours(), this.startHour);

        let startMinute;
        if (this.duration === 60 || now.getHours() < this.startHour) {
            startMinute = 0;
        } else {
            startMinute = now.getMinutes() < 30 ? 0 : 30;
        }

        const timeSlots = [];

        if (startHour < this.stopHour) {
            // First time slot
            const intervalStart = parse(`${startHour}:${startMinute}`, 'HH:mm', addDays(new Date(), daysOffset));
            const intervalEnd = addMinutes(intervalStart, this.duration);

            timeSlots.push({
                start: intervalStart,
                end: intervalEnd
            });

            // All asubsequent time slots
            while (timeSlots[timeSlots.length-1].start.getHours() < this.stopHour) {
                const latestInterval = timeSlots[timeSlots.length-1];
                const intervalStart = latestInterval.end;
                const intervalEnd = addMinutes(intervalStart, this.duration);

                timeSlots.push({
                    start: intervalStart,
                    end: intervalEnd,
                    isRequesting: false
                });

                // Don't pass midnight
                if (latestInterval.start.getHours() === 23 && latestInterval.end.getHours() === 0) {
                    break;
                }
            }
        }

        timeSlots.pop(); // Always remove the last, as it overlaps the max allowed one.

        return timeSlots;
    }

    /**
     * Get all bookings for the location within current day.
     * @returns {Promise<Object[]>}
     */
    getBookingsToday(): Promise<Object[]> {
        if (!this.location || this.location.properties.bookable !== true) {
            return Promise.reject('NOT BOOKABLE');
        }

        const startTime = new Date();
        startTime.setHours(startTime.getHours(), 0, 0, 0);

        const endTime = new Date();
        endTime.setHours(23, 59, 59, 999);

        return mapsindoors.services.BookingService.getBookingsUsingQuery({
            location: this.location,
            startTime: startTime.toUTCString(),
            endTime: endTime.toUTCString()
        });
    }

    /**
     * Decorate time slot with information about any existing booking.
     * @param {BookingTimeSlot} timeSlot
     * @param {Object[]} bookings
     * @returns {BookingTimeSlot}
     */
    assignBookingInfoToTimeslot(timeSlot: BookingTimeSlot, bookings): BookingTimeSlot {
        timeSlot.available = true;

        for (const booking of bookings) {
            const bookingInterval = {
                start: new Date(booking.startTime),
                end: new Date(booking.endTime)
            };

            if (areIntervalsOverlapping(timeSlot, bookingInterval)) {
                timeSlot.available = false;
                timeSlot.cancellable = booking.managed;

                if (timeSlot.cancellable) {
                    timeSlot.bookingId = booking.bookingId;
                }
            }
        }

        return timeSlot;
    }

    /**
     * Convert time string to a localized one, based on browser settings.
     * @param {Date} timeString
     * @returns {string}
     */
    formatTime(timeString: Date): string {
        return timeString.toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        }).toLowerCase();
    }

    /**
     * Update a timeslot in timeSlots state.
     * Due to the nature of state in Stencil, we need to reassign the whole array.
     *
     * @param {BookingTimeSlot} timeSlot
     * @param {number} timeSlotIndex
     * @param {object} changes
     */
    updateTimeslot(timeSlotIndex: number, changes: object): void {
        const timeSlots = [...this.timeSlots];

        const timeSlotToUpdate = this.timeSlots[timeSlotIndex];

        const newTimeSlot = {...timeSlotToUpdate, ...changes};

        timeSlots[timeSlotIndex] = newTimeSlot;
        this.timeSlots = timeSlots;
    }


    /**
     * Perform a booking via the SDK.
     *
     * @param {BookingTimeSlot} timeSlot
     * @param {number} timeSlotIndex
     */
    performBooking(timeSlot: BookingTimeSlot, timeSlotIndex: number): void {
        this.updateTimeslot(timeSlotIndex, { isRequesting: true });
        const booking = new mapsindoors.services.BookingService.MPBooking({
            ownerId: undefined,
            locationId: this.location.id,
            title: this.bookingTitle,
            description: null,
            participants: [],
            startTime: timeSlot.start,
            endTime: timeSlot.end
        });

        mapsindoors.services.BookingService.performBooking(booking)
            .then((createdBooking) => {
                // Decorate timeslot with the booking info.
                // Sadly, we cannot retrieve list of bookings due to timing issues on the backend:
                // A created booking is not given when retrieving list immediately after performing the booking.
                this.updateTimeslot(timeSlotIndex, {
                    available: false,
                    bookingId: createdBooking.bookingId,
                    cancellable: true
                });

                this.bookingCompleted.emit(createdBooking);
            })
            .catch(error => {
                this.bookingFailed.emit(error);
            })
            .finally(() => this.updateTimeslot(timeSlotIndex, { isRequesting: false }));
    }

    /**
     * Cancel a booking via the SDK.
     *
     * @param {BookingTimeSlot} timeSlot
     * @param {number} timeSlotIndex
     */
    cancelBooking(timeSlot: BookingTimeSlot, timeSlotIndex: number): void {
        this.updateTimeslot(timeSlotIndex, { isRequesting: true });
        const booking = new mapsindoors.services.BookingService.MPBooking({ id: timeSlot.bookingId });

        mapsindoors.services.BookingService.cancelBooking(booking)
            .then(() => {
                // Decorate timeslot with the booking info.
                // Sadly, we cannot retrieve list of bookings due to timing issues on the backend:
                // A cancelled booking is not given when retrieving list immediately after performing the booking.
                this.updateTimeslot(timeSlotIndex, {
                    available: true,
                    bookingId: null,
                    cancellable: false
                });

                this.cancelCompleted.emit();
            })
            .catch(error => {
                this.cancelFailed.emit(error);
            })
            .finally(() => this.updateTimeslot(timeSlotIndex, { isRequesting: false }));
    }

    /**
     * Render booking button for a time slot depending on booking state info in given time slot.
     * @param {BookingTimeSlot} timeSlot
     * @returns {JSX.Element}
     */
    renderButton(timeSlot: BookingTimeSlot, timeSlotIndex: number): JSX.Element {
        if (timeSlot.cancellable) {
            return (<button disabled={timeSlot.isRequesting} type="button" onClick={() => this.cancelBooking(timeSlot, timeSlotIndex)} class="mi-button mi-button--small mi-button--delete">
                {!this.isInternetExplorer && <mi-icon class="booking-icon booking-icon--cancel" icon-name="circled-minus"></mi-icon>}
                {this.translations.cancel}
            </button>);
        } else if (timeSlot.available) {
            return (<button disabled={timeSlot.isRequesting} type="button" onClick={() => this.performBooking(timeSlot, timeSlotIndex)} class="mi-button mi-button--primary mi-button--small">
                {!this.isInternetExplorer && <mi-icon class="booking-icon" icon-name="circled-plus"></mi-icon>}
                {this.translations.book}
            </button>);
        } else {
            return (<button disabled={true} type="button" class="mi-button mi-button--small">
                {!this.isInternetExplorer && <mi-icon class="booking-icon booking-icon--blocked" icon-name="circled-blocked"></mi-icon>}
                {this.translations.booked}
            </button>);
        }
    }

    componentWillLoad(): void {
        this.updateBookings();
    }

    /**
     * @returns {JSX.Element}
     */
    render(): JSX.Element {
        return (
            <Host>
                <ul>
                    {this.timeSlots.map(((timeSlot, timeSlotIndex) => {
                        if (timeSlotIndex >= this.show) return null;
                        return (<li>
                            {this.formatTime(timeSlot.start)} - {this.formatTime(timeSlot.end)}
                            {this.renderButton(timeSlot, timeSlotIndex)}
                        </li>);
                    }))}
                </ul>
            </Host>
        );
    }

}
