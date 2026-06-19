type UserRoles =
	| "admin"
	| "registry"
	| "doctor"
	| "nurse"
	| "pharmacist"
	| "lab_technician"
	| "accounts"
	| "ward_manager";

type RateLimitRole = UserRoles | "guest";

