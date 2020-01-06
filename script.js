$(document).ready(function() {

  var apiRoot = 'https://sleepy-journey-00480.herokuapp.com/v1/task/';
  var datatableRowTemplate = $('[data-datatable-row-template]').children()[0];
  var tasksContainer = $('[data-tasks-container]');

  // init
  getAllTasks();

  function createElement(data) {
    var element = $(datatableRowTemplate).clone();

    element.attr('data-task-id', data.taskID);
    element.find('[data-task-name-section] [data-task-name-paragraph]').text(data.taskTitle);
    element.find('[data-task-name-section] [data-task-name-input]').val(data.taskTitle);

    element.find('[data-task-content-section] [data-task-content-paragraph]').text(data.taskContent);
    element.find('[data-task-content-section] [data-task-content-input]').val(data.taskContent);

    return element;
  }

  function handleDatatableRender(data) {
    tasksContainer.empty();
    data.forEach(function(task) {
      createElement(task).appendTo(tasksContainer);
    });
  }

  function getAllTasks() {
    var requestUrl = apiRoot + 'getTasks';

    $.ajax({
      url: requestUrl,
      method: 'GET',
      success: handleDatatableRender
    });
  }

  function handleTaskUpdateRequest() {
    var parentEl = $(this).parent().parent();
    var taskID = parentEl.attr('data-task-id');
    var taskTitle = parentEl.find('[data-task-name-input]').val();
    var taskContent = parentEl.find('[data-task-content-input]').val();
    var requestUrl = apiRoot + 'updateTask';

    $.ajax({
      url: requestUrl,
      method: "PUT",
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        taskID: taskID,
        taskTitle: taskTitle,
        taskContent: taskContent
      }),
      success: function(data) {
        parentEl.attr('data-task-id', data.taskID).toggleClass('datatable__row--editing');
        parentEl.find('[data-task-name-paragraph]').text(taskTitle);
        parentEl.find('[data-task-content-paragraph]').text(taskContent);
      }
    });
  }

  function handleTaskDeleteRequest() {
    var parentEl = $(this).parent().parent();
    var taskID = parentEl.attr('data-task-id');
    var requestUrl = apiRoot + 'deleteTask';

    $.ajax({
      url: requestUrl + '/?' + $.param({
        taskID: taskID
      }),
      method: 'DELETE',
      success: function() {
        parentEl.slideUp(400, function() { parentEl.remove(); });
      }
    })
  }

  function handleTaskSubmitRequest(event) {
    event.preventDefault();

    var taskTitle = $(this).find('[name="title"]').val();
    var taskContent = $(this).find('[name="content"]').val();

    var requestUrl = apiRoot + 'createTask';

    $.ajax({
      url: requestUrl,
      method: 'POST',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      data: JSON.stringify({
        taskTitle: taskTitle,
        taskContent: taskContent
      }),
      complete: function(data) {
        if(data.status === 200) {
          getAllTasks();
        }
      }
    });
  }

  function toggleEditingState() {
    var parentEl = $(this).parent().parent();
    parentEl.toggleClass('datatable__row--editing');

    var taskTitle = parentEl.find('[data-task-name-paragraph]').text();
    var taskContent = parentEl.find('[data-task-content-paragraph]').text();

    parentEl.find('[data-task-name-input]').val(taskTitle);
    parentEl.find('[data-task-content-input]').val(taskContent);
  }

  $('[data-task-add-form]').on('submit', handleTaskSubmitRequest);

  tasksContainer.on('click','[data-task-edit-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-edit-abort-button]', toggleEditingState);
  tasksContainer.on('click','[data-task-submit-update-button]', handleTaskUpdateRequest);
  tasksContainer.on('click','[data-task-delete-button]', handleTaskDeleteRequest);
});