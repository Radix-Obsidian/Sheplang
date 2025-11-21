export interface FriendlyError {
    message: string;
    line: number;
    column: number;
    fixTip: string;
    severity: 'error' | 'warning';
}
export declare function formatFriendlyError(diagnostic: any): FriendlyError;
export declare function formatErrorMessage(error: FriendlyError): string;
