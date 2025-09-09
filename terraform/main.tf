provider "aws" {
  region = var.region
}

data "local_file" "env_file_backend" {
  filename = "${path.module}/../backend/.env"
}

data "local_file" "env_file_frontend" {
  filename = "${path.module}/../.env"
}

data "local_file" "private_key" {
  filename = "${path.module}/deploy_key_plantex"
}

resource "aws_security_group" "web_sg" {
  name        = "${var.project_name}-web-sg"
  description = "Allow HTTP and SSH traffic for ${var.project_name}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-web-sg"
    Project = var.project_name
  }
}

resource "aws_instance" "web" {
  ami           = var.ami
  instance_type = var.instance_type
  key_name      = var.key_name
  security_groups = [aws_security_group.web_sg.name]

  root_block_device {
    volume_size = var.volume_size
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install docker.io -y
              sudo systemctl start docker
              sudo usermod -aG docker ubuntu
              sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              sudo chmod +x /usr/local/bin/docker-compose
              sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
              sudo apt install git -y
              echo "${data.local_file.private_key.content}" > /home/ubuntu/.ssh/id_rsa
              sudo chown ubuntu:ubuntu /home/ubuntu/.ssh/id_rsa
              chmod 600 /home/ubuntu/.ssh/id_rsa
              ssh-keyscan -H github.com >> /home/ubuntu/.ssh/known_hosts
              sudo chown ubuntu:ubuntu /home/ubuntu/.ssh/known_hosts
              cd /home/ubuntu
              sudo -u ubuntu GIT_SSH_COMMAND="ssh -i /home/ubuntu/.ssh/id_rsa -o StrictHostKeyChecking=no" git clone git@github.com:fernando737/plantex.git
              cd plantex
              echo "${data.local_file.env_file_backend.content}" > /home/ubuntu/plantex/backend/.env
              sudo chown ubuntu:ubuntu ./backend/.env
              echo "${data.local_file.env_file_frontend.content}" > /home/ubuntu/plantex/.env
              sudo chown ubuntu:ubuntu .env
              EOF

  tags = {
    Name = "${var.project_name}-docker-ec2"
    Project = var.project_name
    Environment = "production"
  }
}

output "instance_ip" {
  value = aws_instance.web.public_ip
}
