import { Modal } from "@mantine/core";
import { OtpObject } from "../../Pages/Home";

type EditModalProps = {
  opened: boolean;
  onClose: () => void;
  entity: OtpObject;
};

export const EditModal = ({ onClose, opened, entity }: EditModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose}>
      hi {entity.label}
    </Modal>
  );
};
