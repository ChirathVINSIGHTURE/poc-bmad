export function mapReservationCreateError(e: { code?: string } | undefined | null): {
  ok: false;
  code: string;
  message: string;
};

