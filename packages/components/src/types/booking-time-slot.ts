export interface BookingTimeSlot {
    start: Date;
    end: Date;
    available?: boolean;
    cancellable?: boolean;
    isRequesting: boolean;
    bookingId?: string
}
