import { User } from "./User";

// This interface mirrors the backend `Session` model.
// Notes:
// - backend `id` is a string UUID
// - backend field is `expiration` (DateTime). When creating a session the backend
//   expects `expiration` as a string in format "%Y-%m-%d %H:%M:%S" (see controller).
// - backend has `FACode` and `state` fields
// - user_id is provided in the URL when creating: POST /sessions/user/<user_id>
export interface Session {
    id?: string; // UUID from backend
    user_id?: number;
    token?: string;
    expiration?: string | Date; // send as formatted string when creating
    FACode?: string;
    state?: string;
    created_at?: Date | string;
    updated_at?: Date | string;
    user?: User;
}