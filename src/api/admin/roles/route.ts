import type { 
    MedusaRequest, 
    MedusaResponse,
  } from "@medusajs/medusa"
  import RoleService from "../../../services/role"
  export const POST = async (
    req: MedusaRequest, 
    res: MedusaResponse
  ) => {
    // omitting validation for simplicity
    type RequestBody = {
      name: string,
      store_id: string,
      permissions?: string[],
    }
    
    const {
      name,
      store_id,
      permissions = [],
    } = req.body as RequestBody;

    const roleService = req.scope.resolve(
      "roleService"
    ) as RoleService
    

    const role = await roleService.create({
  name,
  store_id,
  permissions: permissions.map((permission) => ({ name: permission, metadata: {} })),})
  
    res.json(role)
  }