import mongoose from "mongoose";

const CalendarItemSchema = new mongoose.Schema({
    id: Number,
    type: String,
    name: String,
    date: String,
    time: String,
    notes: String,
    auth0Id: String // Important: Links the item to the specific Auth0 user!
});

const CalendarItem = mongoose.models.CalendarItem || mongoose.model("CalendarItem", CalendarItemSchema);

export default CalendarItem;