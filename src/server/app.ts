import dotenv from "dotenv";
import { createApp } from "./createApp";

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
const app = createApp();

app.listen(PORT, () => console.log(`🌊 AI Backend running on http://localhost:${PORT}`));
