import * as React from 'react';
import { format } from 'date-fns';
import { User, Mail, Phone, Calendar, Hash } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { BirthDateAgePicker } from '@/components/ui/birth-date-age-picker';
import { UserSchema, User as UserType } from '@/components/data-table/columns';

type Props = {
	initialData?: UserType;
	isEdit?: boolean;
	nextId?: number;
	onSubmit: (data: UserType) => Promise<void> | void;
	onOpenChange?: (open: boolean) => void;
};

export function CustomForm({ initialData, isEdit, nextId, onSubmit, onOpenChange }: Props) {
	const [birthDate, setBirthDate] = React.useState<Date | undefined>(
		initialData ? (initialData.birthDate ? new Date(initialData.birthDate) : undefined) : undefined
	);
	const [age, setAge] = React.useState<number | undefined>(initialData?.age);
	const [phone, setPhone] = React.useState<string>(initialData?.phone ?? '');
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	const autoId = React.useMemo(() => {
		return isEdit ? initialData?.id : (nextId || 1);
	}, [isEdit, initialData?.id, nextId]);

	const clearFieldError = (field: string) => {
		setErrors((prev) => {
			const next = { ...prev };
			delete (next as any)[field];
			return next;
		});
	};

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				const formData = new FormData(e.target as HTMLFormElement);
				const birthDateStr = birthDate ? format(birthDate, 'yyyy-MM-dd') : '';

				const rawId = Number(formData.get('id'));
				const finalId = isEdit 
					? (rawId || initialData?.id || 1)
					: autoId;

				const rawData = {
					id: finalId,
					firstName: (formData.get('firstName') as string) ?? '',
					lastName: (formData.get('lastName') as string) ?? '',
					age: age || 0,
					email: (formData.get('email') as string) ?? '',
					phone: phone,
					birthDate: birthDateStr,
				} as unknown as UserType;

				console.log('Form data being submitted:', rawData);
				console.log('Auto-generated ID:', autoId, 'Final ID used:', finalId);
				console.log('Is editing?', isEdit, 'Initial data ID:', initialData?.id);

				try {
					const validatedData = UserSchema.parse(rawData);
					console.log('Validated data to be saved:', validatedData);
					await Promise.resolve(onSubmit(validatedData));
					console.log('User successfully saved with ID:', validatedData.id);
					(e.target as HTMLFormElement).reset();
					setBirthDate(undefined);
					setAge(undefined);
					setPhone('');
					setErrors({});
					onOpenChange?.(false);
				} catch (error: any) {
					const fieldErrors: Record<string, string> = {};
					if (error?.issues) {
						error.issues.forEach((err: any) => {
							fieldErrors[err.path?.[0]] = err.message;
						});
					}
					setErrors(fieldErrors);
				}
			}}
			className="space-y-3"
		>
			{/* Auto ID Display */}
			{!isEdit && (
				<div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/50">
					<div className="flex items-center gap-2">
						<Hash className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm font-medium">Auto-Generated ID</span>
					</div>
					<div className="text-lg font-bold text-foreground">#{autoId}</div>
				</div>
			)}

			{/* ID Field for Edit */}
			{isEdit && (
				<div className="space-y-2">
					<label className="flex items-center gap-2 text-sm font-medium">
						<Hash className="w-4 h-4" />
						User ID
					</label>
					<Input
						name="id"
						type="number"
						value={autoId}
						readOnly
						className="bg-muted cursor-not-allowed"
					/>
				</div>
			)}

			{/* Name Fields */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="space-y-2">
					<label className="flex items-center gap-2 text-sm font-medium">
						<User className="w-4 h-4" />
						First Name
					</label>
					<Input
						name="firstName"
						placeholder="Name"
						error={errors.firstName}
						onChange={() => clearFieldError('firstName')}
						defaultValue={initialData?.firstName}
					/>
				</div>

				<div className="space-y-2">
					<label className="flex items-center gap-2 text-sm font-medium">
						<User className="w-4 h-4" />
						Last Name
					</label>
					<Input
						name="lastName"
						placeholder="last name"
						error={errors.lastName}
						onChange={() => clearFieldError('lastName')}
						defaultValue={initialData?.lastName}
					/>
				</div>
			</div>

			{/* Email */}
			<div className="space-y-2">
				<label className="flex items-center gap-2 text-sm font-medium">
					<Mail className="w-4 h-4" />
					Email Address
				</label>
				<Input
					name="email"
					type="email"
					placeholder="name@example.com"
					error={errors.email}
					onChange={() => clearFieldError('email')}
					defaultValue={initialData?.email}
				/>
			</div>

			{/* Phone */}
			<div className="space-y-2">
				<label className="flex items-center gap-2 text-sm font-medium">
					<Phone className="w-4 h-4" />
					Phone Number
				</label>
				<PhoneInput
					value={phone}
					onChange={(v) => {
						setPhone(v);
						clearFieldError('phone');
					}}
					placeholder="Enter phone number"
					error={errors.phone}
				/>
			</div>

			{/* Birth Date & Age */}
			<div className="space-y-2">
				<label className="flex items-center gap-2 text-sm font-medium">
					<Calendar className="w-4 h-4" />
					Birth Date & Age
				</label>
				<BirthDateAgePicker
					birthDate={birthDate}
					onBirthDateChange={(d) => {
						setBirthDate(d);
						clearFieldError('birthDate');
						clearFieldError('age');
					}}
					onAgeChange={(a) => {
						setAge(a);
						clearFieldError('age');
					}}
					birthDateError={errors.birthDate}
					ageError={errors.age}
					className="space-y-3"
				/>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3 pt-2">
				<Button type="submit" className="flex-1 bg-black hover:gray-700">
					{isEdit ? 'Update User' : 'Create User'}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => onOpenChange?.(false)}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

export default CustomForm;
