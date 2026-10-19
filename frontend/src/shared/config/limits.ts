// Лимит картинки напитка — тот же MAX_ENERGY_DRINK_IMAGE_SIZE из общего .env, которым бэк режет тело
// запроса (413). Читается на сервере во время запроса, поэтому смена лимита не требует пересборки фронта;
// в клиентскую форму передаётся пропсом.
export function maxImageBytes(): number {
  return Number(process.env.MAX_ENERGY_DRINK_IMAGE_SIZE) || 1_048_576
}
