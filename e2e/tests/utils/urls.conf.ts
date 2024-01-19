
export class UrlUtil {
    private _url: URL;

    constructor(base_url: string, path: string) {
        this._url = new URL(path, base_url)
    }
    
    get url() {
        return this._url
    }
    
    get pathname() {
        return this._url.pathname
    }
    
    get urlHavingSamePathname() {
        return (ut: URL) => {
            return ut.pathname === this._url.pathname
        }
    }
}

export class FinancialAppUrlUtilHolder {

    public root: UrlUtil;
    public management: UrlUtil;
    public preference: UrlUtil;

    constructor(
        private base_url: string,
    ) {
        this.root = new UrlUtil(base_url, '/')
        this.management = new UrlUtil(base_url, '/administration/management')
        this.preference = new UrlUtil(base_url, '/preference')
    }
}

export function financial_url_helper(baseUrl?: string) {
    let base = "http://fake.local"
    if (baseUrl)
        base = baseUrl
    return new FinancialAppUrlUtilHolder(base)
}