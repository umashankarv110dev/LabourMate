export interface Site {
    id: string;
    name: string;
}

export interface Customer {
    id: string;
    customerName: string;
    sites: Site[];
}