import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check } from "lucide-react";
import { Address } from '@/lib/customerMutations';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) => {
  return (
    <Card className={`relative ${address.isDefault ? 'border-primary' : ''}`}>
      {address.isDefault && (
        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          Default
        </div>
      )}
      
      <CardContent className="pt-6">
        <div className="space-y-1 mb-4">
          <p className="font-medium">
            {address.firstName} {address.lastName}
          </p>
          {address.company && (
            <p className="text-muted-foreground text-sm">{address.company}</p>
          )}
          <p className="text-muted-foreground text-sm">{address.address1}</p>
          {address.address2 && (
            <p className="text-muted-foreground text-sm">{address.address2}</p>
          )}
          <p className="text-muted-foreground text-sm">
            {address.city}, {address.state} {address.postcode}
          </p>
          <p className="text-muted-foreground text-sm">{address.country}</p>
          {address.phone && (
            <p className="text-muted-foreground text-sm">{address.phone}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(address)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-500 hover:text-red-600"
            onClick={() => onDelete(address.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onSetDefault(address.id)}
            >
              <Check className="h-4 w-4 mr-2" />
              Set as Default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
