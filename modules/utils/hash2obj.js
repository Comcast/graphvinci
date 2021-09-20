export function hash2obj(hash) {
  if (hash) {
    return hash
      .slice(1)
      .replace(/^\//, '')
      .split(/[&?]/)
      .map( el => el.split('=') )
      .reduce( (pre, cur) => {
        const key = cur[0];
        const val = cur[1];
        pre[key] = val;
        return pre;
      }, {} );
  }
  return {};
}
