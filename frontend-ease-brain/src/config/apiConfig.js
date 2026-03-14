// Deprecated: re-export BASE_URL from the canonical utils module to avoid
// duplicated logic. Keep this file for backward compatibility with any
// imports that referenced `src/config/apiConfig.js`.
import { BASE_URL } from "@/utils/utils";

export { BASE_URL };
