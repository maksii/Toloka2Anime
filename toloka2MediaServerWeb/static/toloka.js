$(document).ready(function () {
    var initialized = false;
    var table;

    // Handle form submission event
    $('.d-flex[role="search"]').on('submit', function (e) {
        e.preventDefault();
        var query = $(this).find('input[type="search"]').val();
        
        if (!initialized) {
            // Initialize DataTable
            table = $('#torrentTable').DataTable({
                ajax: {
                    url: "/get_torrents?query=" + query,
                    dataSrc: function(json) {
                        var result = json;
                        return result;
                    }
                },
                columns: [
                    {
                        className: 'details-control',
                        orderable: false,
                        data: null,
                        defaultContent: '',
                        render: function () {
                            return ' <i class="bi bi-arrows-angle-expand" aria-hidden="true"></i>';
                        },
                        width: "15px"
                    },
                    { data: "forum", title: 'Forum', visible: true },
                    { data: "name", title: 'Title', visible: true },
                    { data: "author", title: 'Author', visible: true },
                    { data: "date", title: 'Last Updated', visible: true },
                    { data: "answers", title: 'answers', visible: false },
                    { data: "forum_url", title: 'forum_url', visible: false },
                    { data: "leechers", title: 'leechers', visible: false },
                    { data: "seeders", title: 'seeders', visible: false },
                    { data: "size", title: 'size', visible: false },
                    { data: "status", title: 'status', visible: false },
                    { data: "torrent_url", title: 'torrent_url', visible: false },
                    { data: "url", title: 'url', visible: false },
                    { data: "verify", title: 'verify', visible: false },
                    { data: null, title: 'Actions', orderable: false, render: function(data, type, row) {
                        return `
                            <button class="btn btn-outline-warning" disabled><span class="bi bi-download" aria-hidden="true"></span><span class="visually-hidden" role="status">Direct Download</span></button>
                            <button class="btn btn-outline-warning" disabled><span class="bi bi-cloud-download" aria-hidden="true"></span><span class="visually-hidden" role="status">Add to client</span></button>
                            <button class="btn btn-outline-primary" disabled><span class="bi bi-chevron-double-left" aria-hidden="true"></span><span class="visually-hidden" role="status">Copy Values</span></button>
                        `;
                    }, visible: true }
                ],
                order: [[4, 'des']],
                
                layout: {
                    topStart: {
                        buttons: [
                            {
                                extend: 'colvis',
                                postfixButtons: ['colvisRestore']
                            },
                            { text: 'Refresh', action: function ( e, dt, node, config ) {
                                dt.ajax.reload();
                            }}
                        ]
                    }
                }
            });

            $('#torrentTable tbody').on('click', 'td.details-control', function () {
                var tr = $(this).closest('tr');
                var row = table.row(tr);

                if (row.child.isShown()) {
                    row.child.hide();
                    tr.removeClass('shown');
                } else {
                    var data = row.data();
                    row.child(formatLoading()).show();
                    tr.addClass('shown');

                    $.ajax({
                        url: '/get_torrent?id=' + data.url,
                        type: 'GET',
                        success: function (detail) {
                            var childData = formatDetail(detail, data);
                            row.child(childData).show();
                        }
                    });
                }
            });

            initialized = true;
            $('#torrentTable').show();
        } else {
            table.ajax.url('/get_torrents?query=' + query).load();
        }
    });
    function formatLoading() {
        return '<div class="d-flex justify-content-center">' +
               '<div class="spinner-border" role="status">' +
               '<span class="visually-hidden">Loading...</span>' +
               '</div>' +
               '</div>';
    }

    function formatDetail(detail, parentData) {
        let fileItems = detail.files.map(file => `
            <li class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${file.folder_name}</div>
                    ${file.file_name}
                </div>
                <span class="badge text-bg-primary rounded-pill">${file.size}</span>
            </li>
        `).join('');
    
        return `
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="row g-0">
                            <div class="col-md-2">
                                <img src="${detail.thumbnail}" class="card-img-top" alt="...">
                                <div class="d-grid gap-2">
                                    <button type="button" class="btn btn-primary position-relative" disabled>
                                        ${detail.size}
                                        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                                            ${parentData.leechers}
                                            <span class="visually-hidden">leach</span>
                                        </span>
                                        <span class="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger">
                                            ${parentData.seeders}
                                            <span class="visually-hidden">sead</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card-body">
                                    <h5 class="card-title">${detail.author}</h5>
                                    <p class="card-text">${detail.name}</p>
                                    <p class="card-text"><small class="text-body-secondary">Last updated ${detail.date}</small></p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <ol class="list-group list-group-numbered">${fileItems}</ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
});