import { Button } from "../common/Button";

interface RoleSelectorProps {
  onSelect: (role: "EMPLOYER" | "WORKER") => void;
}

export const RoleSelector = ({ onSelect }: RoleSelectorProps) => {
  return (
    <div className="space-y-3">
      <Button fullWidth className="h-14" onClick={() => onSelect("EMPLOYER")}>
        I want workers
      </Button>
      <Button
        fullWidth
        className="h-14"
        variant="secondary"
        onClick={() => onSelect("WORKER")}
      >
        I want work
      </Button>
    </div>
  );
};
