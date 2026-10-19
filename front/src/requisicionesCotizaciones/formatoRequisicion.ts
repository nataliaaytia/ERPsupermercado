export const codigoRequisicion = (idRequisicion: number) =>
    `REQ-${String(idRequisicion).padStart(4, "0")}`;