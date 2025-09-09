variable "project_name" {
  description = "The project name used for resource naming"
  default     = "plantex"
}

variable "region" {
  description = "The AWS region to deploy in"
  default     = "us-east-1"
}

variable "instance_type" {
  description = "The instance type to use"
  default     = "t2.small"
}

variable "ami" {
  description = "The AMI to use for the instance"
  default     = "ami-0c819f65440d5f1d1" # Ubuntu AMI
}

variable "volume_size" {
  description = "The size of the EBS volume in GiB"
  type        = number
  default     = 20  # You can set this to any desired default value
}

variable "key_name" {
  description = "The name of the SSH key pair to use"
  default     = "deploy_key_plantex"
}

variable "vpc_id" {
  description = "The VPC ID to use for the security group"
  default     = "" # You may need to set this to your specific VPC ID if not using the default VPC
}
