// API publik modul akademik. Modul lain hanya boleh mengimpor dari file ini.
export {
  getProfilMahasiswa,
  getKelasDiambil,
  getStatusKrs,
  getJadwal,
  getKhs,
  getIpk,
} from "./service"
export { khsQuerySchema } from "./schemas"
export type * from "./types"
