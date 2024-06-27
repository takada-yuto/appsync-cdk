FROM public.ecr.aws/lambda/python:3.10

# Copies requirements.txt file into the container
COPY ./lambda/python/layer/requirements.txt .

# Installs dependencies found in your requirements.txt file
RUN  pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

WORKDIR ${LAMBDA_TASK_ROOT}
ADD ./lambda/python/function function/

# Set the CMD to your handler start function
CMD [ "function.audToTxt.handler" ]