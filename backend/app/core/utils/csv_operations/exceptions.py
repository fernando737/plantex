# backend/app/core/utils/csv_operations/exceptions.py
"""
Custom exceptions for CSV operations
"""


class CSVOperationError(Exception):
    """Base exception for CSV operations"""
    pass


class CSVImportError(CSVOperationError):
    """Exception raised during CSV import operations"""
    def __init__(self, message, line_number=None, errors=None):
        super().__init__(message)
        self.line_number = line_number
        self.errors = errors or []


class CSVExportError(CSVOperationError):
    """Exception raised during CSV export operations"""
    pass


class CSVValidationError(CSVOperationError):
    """Exception raised during CSV validation"""
    def __init__(self, message, field=None, line_number=None):
        super().__init__(message)
        self.field = field
        self.line_number = line_number