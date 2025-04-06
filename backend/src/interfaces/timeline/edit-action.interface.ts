export interface EditAction {
    type: string;
    timestamp: string; // ISO string
    payload: any; // Replace `any` with a specific payload type if you want tighter control
  }
  