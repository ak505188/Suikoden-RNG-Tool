// Replacement for js-worker-search, whose prebuilt bundle fails to load as an ES module.
// Same behaviour as its defaults: case-insensitive, each query token must be a substring of
// some token of the document, and every query token has to match (AND). An empty query matches all.
export default class SearchIndex {
  constructor({ tokenizePattern = /\s+/ } = {}) {
    this.tokenizePattern = tokenizePattern;
    this.documents = [];
  }

  tokenize(text) {
    return text.trim().toLocaleLowerCase().split(this.tokenizePattern).filter(token => token);
  }

  indexDocument(uid, text) {
    this.documents.push({ uid, tokens: this.tokenize(text) });
    return this;
  }

  search(query) {
    const queryTokens = this.tokenize(query);
    const uids = this.documents
      .filter(({ tokens }) =>
        queryTokens.every(queryToken => tokens.some(token => token.includes(queryToken))))
      .map(({ uid }) => uid);
    return Promise.resolve(uids);
  }

  terminate() {}
}
